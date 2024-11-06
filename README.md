# wdpa_diff_checker
Comparison tool for WDPA versions

Available https://andrewcottam.github.io/wdpa_diff_checker/build/index.html

# Install steps
1. Python REST Server if not already available as a Cloud Run Service
2. Create a PostGIS database if not already available in Cloud SQL
3. Load WDPA data
4. Create WDPA diff data

# 1. Start PostGIS
In this case starting locally:
```
docker run --rm -it --name postgis -p 5432:5432 -v $HOME/Documents/postgres_data:/var/lib/postgresql -e POSTGRES_USER=andrew -e POSTGRES_PASS=password docker.io/kartoza/postgis:16
```

# 2. Load the WDPA into a database
In this case the Oct 2024 File Geodatabase into localhost (if the IP address doesnt work, use localhost): 
```
curl https://d1gam3xoknrgr2.cloudfront.net/current/WDPA_Oct2024_Public.zip --output ~/Downloads/WDPA_Oct2024_Public.zip
cd ~/Downloads
unzip WDPA_Oct2024_Public.zip 'WDPA_Oct2024_Public.gdb/*'
ogr2ogr -f "PostgreSQL" PG:"host=192.168.86.165 dbname=gis user=andrew password=password" \
        ~/Downloads/WDPA_Oct2024_Public.gdb \
        -sql "select * from WDPA_poly_Oct2024" \
        -nln wdpa_oct_2024 -progress --config OGR_ORGANIZE_POLYGONS SKIP
```
In this case the Oct 2024 File Geodatabase into my Google Cloud Platform database:
```
curl https://d1gam3xoknrgr2.cloudfront.net/current/WDPA_Oct2024_Public.zip --output WDPA_Oct2024_Public.zip
unzip WDPA_Oct2024_Public.zip 'WDPA_Oct2024_Public.gdb/*'
ogr2ogr -f "PostgreSQL" PG:"host=<HOST> dbname=<DBNAME> user=<USER> password=<PASSWORD>" \
        WDPA_Oct2024_Public.gdb \
        -sql "select * from WDPA_poly_Oct2024" \
        -nln "wdpa.wdpa_oct_2024" -progress --config OGR_ORGANIZE_POLYGONS SKIP
```

