import json
import csv
import argparse
from outscraper import ApiClient

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
        data.append([dict['name'], dict['full_address'], dict['phone'], dict['site'], dict['rating']])


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



