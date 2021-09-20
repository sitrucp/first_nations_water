# First Nations Drinking Water Advisories & System Upgrades

The Government of Canada is working with First Nations to end long-term drinking water advisories which have been in effect for more than 12 months since November 2015. 

Indigenous Services Canada maintains a map of these advisories <a href="https://www.sac-isc.gc.ca/eng/1620925418298/1620925434679#" target="_blank">here</a>. The data behind this map has been re-purposed to create the charts below. The ISC map page has a link to download the map data.

The map data source and download file are actually a subset of a larger data file which contains about 700 records. A copy of this larger data file <a href="https://github.com/sitrucp/first_nations_water/blob/master/lTDWA_map_data_1572010201618_eng.txt" target="_blank">lTDWA_map_data_1572010201618_eng.txt</a> is contained in this repository. The ISC website url for this larger data file is <a href="https://www.sac-isc.gc.ca//DAM/DAM-ISC-SAC/DAM-WTR/STAGING/texte-text/lTDWA_map_data_1572010201618_eng.txt" target="_blank">https://www.sac-isc.gc.ca//DAM/DAM-ISC-SAC/DAM-WTR/STAGING/texte-text/lTDWA_map_data_1572010201618_eng.txt</a>

The <a href="https://github.com/sitrucp/first_nations_water/blob/master/water_map_data.py" target="_blank">water_map_data.py</a> code retrieves the larger data file.

The <a href="https://github.com/sitrucp/first_nations_water/blob/master/first_nations_water.js" target="_blank">first_nations_water.js</a> code parses and transforms the larger data file to create the 160 records used to create charts on this <a href="https://sitrucp.github.io/first_nations_water" target="_blank">Github.io web page</a> for this repository. 

# Bonus Excel File For Desktop Analysis
The Excel file in the repository <a href="https://github.com/sitrucp/first_nations_water/blob/master/ICS LTDWA Power Query.xlsx" target="_blank"> uses a Power Query to link to the website larger data file and transform it to 160 advisory records. Download the Excel to do desktop analysis.