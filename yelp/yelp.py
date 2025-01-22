from yelpapi import YelpAPI
import argparse
from pprint import pprint

import pickle
import json

argparser = argparse.ArgumentParser(description='Example Yelp queries using yelpapi. '
                                                'Visit https://www.yelp.com/developers/v3/manage_app to get the '
                                                'necessary API keys.')
argparser.add_argument('api_key', type=str, help='Yelp Fusion API Key')
args = argparser.parse_args()

with YelpAPI(args.api_key) as yelp_api:
    """
        Example search by location text and term. 
        
        Search API: https://www.yelp.com/developers/documentation/v3/business_search
    """
    print('***** 5 best rated ice cream places in Austin, TX *****\n{}\n'.format("yelp_api.search_query(term='ice cream', "
                                                                                 "location='austin, tx', sort_by='rating', "
                                                                                 "limit=5)"))
    response = yelp_api.search_query(term='boba', location='united states', sort_by='rating', limit=5)

    # save the response for future processing, so you don't eat into your API calls
    with open('yelp.pkl', 'wb') as f:
        pickle.dump(response, f)


    print('\n-------------------------------------------------------------------------\n')

