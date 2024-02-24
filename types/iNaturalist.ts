export type SearchResponse = {
  total_results: number,
  page: number,
  per_page: number,
  results: SearchResult[]
}

export type SearchResult = {
  score: number,
  type: string,
  matches: string[],
  record: Record
}

type Record = {
  id: number,
  rank: string,
  rank_level: number,
  iconic_taxon_id: number,
  ancestor_ids: number[],
  is_active: boolean,
  min_species_taxon_id: number,
  name: string,
  parent_id: number,
  ancestry: string,
  min_species_ancestry: string,
  extinct: boolean,
  created_at: Date,
  default_photo: Photo,
  taxon_changes_count: number,
  taxon_schemes_count: number,
  observations_count: number,
  photos_locked: boolean,
  universal_search_rank: number,
  flag_counts: FlagCounts,
  current_synonymous_taxon_ids?: number[],
  taxon_photos: TaxonPhotoResult[],
  atlas_id?: number,
  complete_species_count?: number,
  wikiedia_url: string,
  complete_rank: string,
  matched_term: string,
  iconic_taxon_name: string,
  conservation_status: ConservationStatus
}

export type Photo = {
  id: number,
  license_code: string,
  attribution: string,
  url: string,
  original_dimensions: iNatPhotoDimensions,
  flags: string[],
  native_page_url?: string,
  native_photo_id?: number,
  type?: string,
  square_url: string,
  small_url?: string,
  medium_url: string
  large_url?: string,
  original_url?: string
}

export type TaxonPhotoResult = {
  taxon_id: number,
  photo: Photo
}

type iNatPhotoDimensions = {
  width: number,
  height: number
}

type FlagCounts = {
  resolved: number,
  unresolved: number
}

type ConservationStatus = {
  place_id?: number,
  source_id?: number,
  user_id?: number,
  authority: string,
  status: string,
  status_name: string,
  geoprivacy?: unknown,
  iucn: number
}
