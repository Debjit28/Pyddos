# Cloudflare Radar Trends Debugging

## Problem

The trends endpoint appeared to work because the backend returned HTTP 200,
but Cloudflare itself was returning HTTP 400 and the application was silently
falling back to mock data.

## Initial Error

Cloudflare returned:

400 Bad Request

Initially the exception logging only showed the HTTP status, which was not
enough to identify the actual problem.

## Investigation

I changed the HTTP error handling to log the upstream response body.

Cloudflare then returned:

Invalid option for dimension.

The application was requesting:

/radar/http/timeseries_groups/threat_category

`threat_category` was not a valid dimension for that endpoint.

## Root Cause

I was using a generic HTTP traffic timeseries endpoint for attack-trend data.

The requirement of the application was actually Layer 7 attack activity over
time, so the endpoint did not match the data I wanted.

## Fix

Changed the request to the Layer 7 attack timeseries endpoint:

/radar/attacks/layer7/timeseries

The request then returned:

success: true

## Second Issue Discovered

The existing parser expected:

serie_0:
  timestamps: [...]
  DDoS: [...]

The real response contains:

serie_0:
  timestamps: [...]
  values: [...]

Therefore the request is now successful, but the parser still needs to be
updated.

## Data Freshness Discovery

A 1-hour query returned no datapoints.

The response metadata showed that the requested time window was newer than
Cloudflare's `lastUpdated` timestamp.

A 24-hour query returned real historical datapoints successfully.

This showed that API availability and data freshness are separate concerns.

## Current Status

- Authentication: working
- Cloudflare request: working
- Correct attack API family: identified
- 24-hour real data: working
- Parser: needs redesign
- 1-hour freshness handling: needs redesign

## Lessons

1. HTTP 400 alone does not explain the root cause; inspect the response body.
2. A backend HTTP 200 does not prove an upstream API succeeded when fallback
   data is being returned.
3. Choose an API endpoint based on the semantics of the data required, not
   merely because its name looks related.
4. A successful API request can still return an empty dataset if the requested
   time range is ahead of the provider's latest available data.
5. Do not change a parser until the real upstream response structure has been
   inspected.