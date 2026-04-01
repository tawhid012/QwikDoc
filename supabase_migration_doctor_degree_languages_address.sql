-- Run in Supabase SQL Editor to add doctor degree, languages, and patient address on bookings.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS languages_fluent TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_address TEXT;

COMMENT ON COLUMN public.doctors.degree IS 'Professional degree shown beside doctor name (e.g. MBBS, MD).';
COMMENT ON COLUMN public.doctors.languages_fluent IS 'Languages the doctor speaks fluently (comma-separated or free text).';
COMMENT ON COLUMN public.appointments.patient_address IS 'Address provided by patient when booking.';
