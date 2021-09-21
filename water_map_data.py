import requests
import pathlib


## download map page data file

## Note the file is defined in page as follows:
## "LinkAjaxSource": "/DAM/DAM-ISC-SAC/DAM-WTR/STAGING/texte-text/lTDWA_map_data_1572010201618_eng.txt"
## possibly could get the "LinkAjaxSource" instead of file name, in case it changes in future

file_name = 'lTDWA_map_data_1572010201618_eng.txt'
url = 'https://www.sac-isc.gc.ca//DAM/DAM-ISC-SAC/DAM-WTR/STAGING/texte-text/'
file_path = str(pathlib.Path(__file__).parent.resolve()) + '/'

# get content of downloadable csv file and saving it to file
response = requests.get(url  + file_name)
if response.status_code == 200:
    with open(file_path + file_name, 'wb') as file:
        file.write(response.content)
else:
    print(file_name, 'download failed')
	
	
	