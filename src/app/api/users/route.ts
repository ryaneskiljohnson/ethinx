import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth'
import { auth, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.MANAGE_AGENTS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('users')
      .select(`
        id, name, email, role, status, license_number, phone, profile_image_url,
        created_at, updated_at, last_login,
        downloads:COALESCE((SELECT COUNT(*) FROM downloads WHERE user_id = users.id), 0),
        asset_count:COALESCE((SELECT COUNT(*) FROM brand_assets WHERE created_by = users.id), 0)
      `)
      .eq('brokerage_id', currentUser.brokerage_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Add permission mapping
    const usersWithPermissions = users.map(user => ({
      ...user,
      permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || []
    }))

    // Get total count for pagination
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('brokerage_id', currentUser.brokerage_id)

    return NextResponse.json({
      users: usersWithPermissions,
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.MANAGE_AGENTS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      role,
      license_number,
      phone,
      profileImageUrl
    } = body

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate role
    if (!Object.keys(ROLE_PERMISSIONS).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('brokerage_id', currentUser.brokerage_id)
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Create user
    const userData = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      brokerage_id: currentUser.brokerage_id,
      license_number,
      phone,
      profile_image_url: profileImageUrl,
      status: 'pending',
      permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Send welcome email (implement email service)
    await this.sendWelcomeEmail(user.email, user.name, currentUser.brokerage_id)

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.MANAGE_AGENTS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate role if being updated
    if (updateData.role && !Object.keys(ROLE_PERMISSIONS).includes(updateData.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update permissions if role changed
    if (updateData.role) {
      updateData.permissions = ROLE_PERMISSIONS[updateData.role as keyof typeof ROLE_PERMISSIONS]
    }

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('brokerage_id', currentUser.brokerage_id)
      .select()
      .single()

   if (error) {
     return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
   }

   return NextResponse.json({
     message: 'User updated successfully',
     user: {
       id: user.id,
       name: user.name,
       email: user.email,
       role: user.role,
       status: user.status,
       updatedAt: user.updated_at
     }
   })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.MANAGE_AGENTS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Soft delete by changing status to inactive
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('brokerage_id', currentUser.brokerage_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
    }

    return NextResponse.json({ message: 'User deactivated successfully' })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper methods
async function sendWelcomeEmail(email: string, name: string, brokerageId: string): Promise<void> {
  // Implementation would integrate with email service (SendGrid, SES, etc.)
  console.log(`Sending welcome email to ${email} for user ${name}`)
}
