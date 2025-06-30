// Supabase Edge Function: Express-like API router
// Handles all SAM.gov compatible endpoints

// @ts-ignore
import { Hono } from 'https://deno.land/x/hono@v3.12.0/mod.ts'
// @ts-ignore
import { cors } from 'https://deno.land/x/hono@v3.12.0/middleware.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Create app with basePath to handle /functions/v1/api prefix
const app = new Hono({ basePath: '/functions/v1/api' })

// Enable CORS for all routes
app.use('*', cors())

// Remove the authentication middleware since headers are immutable
// The SupabaseApi wrapper will handle sending the correct headers

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
)

// Add logging middleware to debug paths
app.use('*', async (c, next) => {
  console.log('Incoming request path:', c.req.path)
  console.log('Full URL:', c.req.url)
  await next()
})

// SAM.gov search endpoint: /opportunities/v2/search
app.get('/api/opportunities/v2/search', async (c) => {
  try {
    const params = c.req.query()

    // Pagination
    const limit = parseInt(params.limit || '100')
    const page = parseInt(params.page || '1')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .order('posted_date', { ascending: false })

    // Apply filters based on SAM.gov API parameters

    // Keywords (title search)
    if (params.title) {
      query = query.ilike('title', `%${params.title}%`)
    }

    // NAICS codes
    if (params.naicsCode) {
      const naicsCodes = params.naicsCode.split(',')
      query = query.in('naics_code', naicsCodes)
    }

    // Classification codes
    if (params.classificationCode) {
      const codes = params.classificationCode.split(',')
      query = query.in('classification_code', codes)
    }

    // Type filter - map single-letter codes to full names
    if (params.ptype) {
      const typeMap: Record<string, string> = {
        'o': 'Solicitation',
        'p': 'Presolicitation',
        'a': 'Award Notice',
        's': 'Special Notice',
        'k': 'Combined Synopsis/Solicitation',
        'u': 'Justification',
        'r': 'Sources Sought',
        'g': 'Sale of Surplus Property',
        'i': 'Intent to Bundle Requirements'
      }
      const types = params.ptype.split(',')
      const typeNames = types.map(code => typeMap[code] || code)
      query = query.in('type', typeNames)
    }

    // Set-aside filter
    if (params.typeOfSetAside) {
      const setAsides = params.typeOfSetAside.split(',')
      // Map SAM.gov codes to full descriptions
      const setAsideMap: Record<string, string> = {
        'SBA': 'Total Small Business Set-Aside (FAR 19.5)',
        'SBP': 'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside (FAR 19.14)',
        'SDVOSBC': 'Service-Disabled Veteran-Owned Small Business (SDVOSB) Competitive',
        'SDVOSBS': 'Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source',
        'WOSB': 'SBA Certified Women-Owned Small Business (WOSB) Program Set-Aside (FAR 19.15)',
        'WOSBSS': 'Women-Owned Small Business Sole Source',
        'EDWOSB': 'Economically Disadvantaged Women-Owned Small Business',
        'EDWOSBSS': 'Economically Disadvantaged Women-Owned Small Business Sole Source',
        'HUB': 'Historically Underutilized Business (HUBZone) Set-Aside (FAR 19.13)',
        'HZC': 'Historically Underutilized Business (HUBZone) Set-Aside (FAR 19.13)',
        'HZS': 'HUBZone Sole Source',
        '8AN': '8(a) Set-Aside (FAR 19.8)',
        '8A': '8(a) Sole Source (FAR 19.8)',
        '8AC': '8(a) Competitive',
        'IEE': 'Indian Economic Enterprise (IEE) Set-Aside (specific to Department of Interior and Indian Health Services)',
        'ISBEE': 'Indian Small Business Economic Enterprise (ISBEE) Set-Aside (specific to Department of Interior and Indian Health Services)',
        'BICiv': 'Buy Indian Act',
        'VSA': 'Veteran-Owned Small Business Set-Aside (specific to Department of Veterans Affairs)',
        'VSS': 'Veteran-Owned Small Business Sole Source',
        'LAS': 'Local Area Set-Aside',
        'NONE': 'No Set-Aside',
      }
      const descriptions = setAsides.map(code => setAsideMap[code] || code)
      query = query.in('set_aside', descriptions)
    }

    // Date filters
    if (params.postedFrom) {
      query = query.gte('posted_date', params.postedFrom)
    }
    if (params.postedTo) {
      query = query.lte('posted_date', params.postedTo)
    }
    if (params.rdlFrom) {
      query = query.gte('response_deadline', params.rdlFrom)
    }
    if (params.rdlTo) {
      query = query.lte('response_deadline', params.rdlTo)
    }

    // Location filters
    if (params.state) {
      const states = params.state.split(',')
      query = query.in('pop_state', states)
    }
    if (params.zip) {
      const zips = params.zip.split(',')
      query = query.in('pop_zip', zips)
    }

    // Active filter
    if (params.active === 'true') {
      query = query.eq('active', 'Yes')
    } else if (params.active === 'false') {
      query = query.eq('active', 'No')
    }

    // Notice ID filter (for specific opportunity)
    if (params.noticeid) {
      query = query.eq('notice_id', params.noticeid)
    }

    // Execute query with pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Transform data to match SAM.gov response format
    const opportunities = (data || []).map(row => ({
      noticeId: row.notice_id,
      title: row.title,
      solicitationNumber: row.sol_number,
      fullParentPathName: row.department_agency,
      fullParentPathCode: row.cgac,
      organizationType: row.organization_type,
      postedDate: row.posted_date,
      type: row.type,
      baseType: row.base_type,
      archiveType: row.archive_type,
      archiveDate: row.archive_date,
      typeOfSetAside: mapSetAsideToCode(row.set_aside),
      typeOfSetAsideDescription: row.set_aside,
      naicsCode: row.naics_code,
      classificationCode: row.classification_code,
      active: row.active,
      responseDeadLine: row.response_deadline,
      description: `/api/opportunities/v1/noticedesc?noticeid=${row.notice_id}`,
      uiLink: row.link,
      officeAddress: {
        city: row.city,
        state: row.state,
        zipcode: row.zip_code,
        countryCode: row.country_code,
      },
      placeOfPerformance: row.pop_city ? {
        city: row.pop_city,
        state: row.pop_state,
        zipcode: row.pop_zip,
        countryCode: row.pop_country,
      } : null,
      pointOfContact: [
        ...(row.primary_contact_fullname ? [{
          type: 'primary',
          fullName: row.primary_contact_fullname,
          title: row.primary_contact_title,
          email: row.primary_contact_email,
          phone: row.primary_contact_phone,
          fax: row.primary_contact_fax,
        }] : []),
        ...(row.secondary_contact_fullname ? [{
          type: 'secondary',
          fullName: row.secondary_contact_fullname,
          title: row.secondary_contact_title,
          email: row.secondary_contact_email,
          phone: row.secondary_contact_phone,
          fax: row.secondary_contact_fax,
        }] : []),
      ],
      award: row.award_number ? {
        awardee: {
          name: row.awardee,
          manual: false,
        }
      } : null,
      additionalInfoLink: row.additional_info_link,
    }))

    // Return SAM.gov compatible response
    const response = {
      totalRecords: count || 0,
      limit: limit,
      offset: offset,
      opportunitiesData: opportunities,
      links: []
    }

    return c.json(response)

  } catch (error) {
    return c.json({ error: error.message }, 400)
  }
})

// SAM.gov description endpoint: /opportunities/v1/noticedesc
app.get('/api/opportunities/v1/noticedesc', async (c) => {
  try {
    const noticeId = c.req.query('noticeid')

    if (!noticeId) {
      throw new Error('Missing required parameter: noticeid')
    }

    // Get opportunity description
    const { data, error } = await supabase
      .from('opportunities')
      .select('description')
      .eq('notice_id', noticeId)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error(`Opportunity with ID ${noticeId} not found`)
    }

    // Return description in SAM.gov format
    return c.json({
      description: data.description || 'No description available'
    })

  } catch (error) {
    return c.json({ error: error.message }, 400)
  }
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    endpoints: [
      '/api/opportunities/v2/search',
      '/api/opportunities/v1/noticedesc'
    ]
  })
})

// 404 handler
app.notFound((c) => {
  console.log('404 Not Found:', c.req.path)
  return c.json({
    error: 'Endpoint not found',
    available_endpoints: [
      '/api/opportunities/v2/search',
      '/api/opportunities/v1/noticedesc',
      '/api/health'
    ]
  }, 404)
})

// Helper function to map set-aside descriptions back to codes
function mapSetAsideToCode(setAsideText: string): string | null {
  if (!setAsideText || setAsideText === 'None/Null' || setAsideText === 'No Set aside used') return null

  const mapping: Record<string, string> = {
    'Total Small Business Set-Aside (FAR 19.5)': 'SBA',
    'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside (FAR 19.14)': 'SBP',
    'SBA Certified Women-Owned Small Business (WOSB) Program Set-Aside (FAR 19.15)': 'WOSB',
    'Historically Underutilized Business (HUBZone) Set-Aside (FAR 19.13)': 'HUB',
    '8(a) Set-Aside (FAR 19.8)': '8AN',
    '8(a) Sole Source (FAR 19.8)': '8A',
    '8(a) Competitive': '8AC',
    'Veteran-Owned Small Business Set-Aside (specific to Department of Veterans Affairs)': 'VSA',
    'Indian Economic Enterprise (IEE) Set-Aside (specific to Department of Interior and Indian Health Services)': 'IEE',
    'Indian Small Business Economic Enterprise (ISBEE) Set-Aside (specific to Department of Interior and Indian Health Services)': 'ISBEE',
  }

  return mapping[setAsideText] || setAsideText
}

// Start the server
Deno.serve(app.fetch)
