import requests

## download map page data file

# url of initial page with data
url = 'https://www.sac-isc.gc.ca//DAM/DAM-ISC-SAC/DAM-WTR/STAGING/texte-text/lTDWA_map_data_1572010201618_eng.txt'
#url = './lTDWA_map_data_1572010201618_eng.json'
file_path = 'ws_first_nations_water/'
file_name = 'lTDWA_map_data_1572010201618_eng.json'

# get content of downloadable csv file and saving it to file
response = requests.get(url)
if response.status_code == 200:
    with open(file_path + file_name, 'wb') as file:
        file.write(response.content)
else:
    print('lTDWA_map_data_1572010201618_eng.txt download failed')