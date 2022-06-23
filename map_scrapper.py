#!/usr/bin/env python3

import json
import csv
import argparse
from outscraper import ApiClient
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import chromedriver_autoinstaller
chromedriver_autoinstaller.install()
driver = webdriver.Chrome()
driver.get("https://web.whatsapp.com")
API_KEY = 'Z29vZ2xlLW9hdXRoMnwxMTc0MDk1OTAxOTcxMjgxNjQ1ODN8NjJhMGFhMWJkMg'


def search(q, n):
    api_client = ApiClient(api_key=API_KEY)


    result = api_client.google_maps_search_v2(q, limit=n, language='en')


    jtopy = json.dumps(result)


    dict_json=json.loads(jtopy)[0]

    return dict_json


def save_to_file(dict_json, file_name):

    header = ['name', 'full_address', 'phone', 'site', 'rating']

    data = []
   
    for dict in dict_json:
        phone=dict['phone'].replace(" ","").replace("+","")
        driver.get("https://web.whatsapp.com/send?phone=$"+ str(phone) + "&text&app_absent=0")
        time.sleep(14)
        
        if len(driver.find_elements_by_xpath("/html/body/div[1]/div[1]/span[2]/div[1]/span/div[1]/div/div/div")) == 0: 
             #print(response.status_code)
             data.append([dict['name'], dict['full_address'], dict['phone'], dict['site'], dict['rating']])
        else:
            #print(response.status_code)
            data.append([dict['name'], dict['full_address'], '',dict['site'], dict['rating']])     

    
    with open(file_name, 'w', encoding='UTF8', newline='') as f:
        writer = csv.writer(f)

        # write the header
        writer.writerow(header)

        # write multiple rows
        writer.writerows(data)

    print("csv file created")

def main():
    ap = argparse.ArgumentParser()

    ap.add_argument('-q', help='query', required=True)
    ap.add_argument('-n', help='number of datas', required=True)
    ap.add_argument('-o', help='csv output file',  required=True)


    args = ap.parse_args()

    data = search(args.q, args.n)
    save_to_file(data, args.o)
    
    print("succefully completed")


if __name__ == '__main__':
    main()



