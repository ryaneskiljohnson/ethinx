import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth'
import { auth, PERMISSIONS } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('brand_assets')
      .select(`
        id, name, category, subcategory, description, file_type, file_url, thumbnail_url,
        metadata, status, downloads, created_at, updated_at,
        uploaded_by:users!created_by(name),
        tags:asset_tags(tag)
      `)
      .eq('brokerage_id', currentUser.brokerage_id)
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,metadata->tags.cs.{${search}}`)
    }

    const { data: assets, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
    }

    // Format response
    const formattedAssets = assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      subcategory: asset.subcategory,
      description: asset.description,
      fileType: asset.file_type,
      fileUrl: asset.file_url,
      thumbnailUrl: asset.thumbnail_url,
      metadata: asset.metadata,
      downloads: asset.downloads,
      status: asset.status,
      uploadedBy: asset.uploaded_by?.name,
      tags: asset.tags?.map((t: any) => t.tag),
      createdAt: asset.created_at,
      updatedAt: asset.updated_at
    }))

    // Get total count for pagination
    const { count } = await supabase
      .from('brand_assets')
      .select('*', { count: 'exact', head: true })
      .eq('brokerage_id', currentUser.brokerage_id)
      .eq('status', 'published')

    return NextResponse.json({
      assets: formattedAssets,
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Assets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and permissions
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.EDIT_ASSETS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      category,
      subcategory,
      description,
      file_type,
      file_url,
      thumbnail_url,
      metadata,
      tags,
      status = 'draft'
    } = body

    // Validate required fields
    if (!name || !category || !file_type || !file_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create asset
    const { data: asset, error: assetError } = await supabase
      .from('brand_assets')
      .insert({
        name,
        category,
        subcategory,
        description,
        file_type,
        file_url,
        thumbnail_url,
        metadata,
        status,
        brokerage_id: currentUser.brokerage_id,
        created_by: currentUser.id
      })
      .select()
      .single()

    if (assetError) {
      return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tag: string) => ({
        asset_id: asset.id,
        tag,
        created_by: currentUser.id
      }))

      await supabase.from('asset_tags').insert(tagInserts)
    }

    return NextResponse.json({
      message: 'Asset created successfully',
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        status: asset.status,
        createdAt: asset.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication and permissions
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.EDIT_ASSETS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    // Update asset
    const { data: asset, error } = await supabase
      .from('brand_assets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('brokerage_id', currentUser.brokerage_id) // Ensure user can only update their brokerage's assets
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Asset updated successfully',
      asset: {
        id: asset.id,
        name: asset.name,
        status: asset.status,
        updatedAt: asset.updated_at
      }
    })

  } catch (error) {
    console.error('Update asset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and permissions
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await auth.hasPermission(currentUser.id, PERMISSIONS.DELETE_ASSETS)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    // Soft delete by changing status to archived
    const { error } = await supabase
      .from('brand_assets')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('brokerage_id', currentUser.brokerage_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Asset deleted successfully' })

  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

