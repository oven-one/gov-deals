#!/bin/bash

# Deploy the unified API Edge Function

echo "Deploying unified SAM.gov compatible API..."
# Go to root of the project
cd "$(dirname "$0")/.."

# Deploy the API function
supabase functions deploy api
