export PGPASSWORD='npg_COGj9FQ0aZHN'
export PGSSLMODE=require

mkdir -p export_csv

tables=$(psql \
  -h ep-soft-rice-adelylkl-pooler.c-2.us-east-1.aws.neon.tech \
  -U neondb_owner \
  -d neondb \
  -Atc "select tablename from pg_tables where schemaname='public' order by tablename;")

for t in $tables; do
  echo "exporting $t..."
  psql \
    -h ep-soft-rice-adelylkl-pooler.c-2.us-east-1.aws.neon.tech \
    -U neondb_owner \
    -d neondb \
    -c "\copy (select * from \"${t}\") to 'export_csv/${t}.csv' with csv header"
done