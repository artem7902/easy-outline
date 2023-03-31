import os
import time
import shortuuid
import re
from decimal import Decimal
import boto3
import html

from newspaper import Article

def add_article_to_dynamo(article):
    dynamo_client = boto3.resource('dynamodb')
    articles_table = dynamo_client.Table(os.environ.get("ARTICLES_TABLE"))
    articles_table.put_item(Item=article)

def clean_html_tags(html_code):
    html_with_decoded_characters = html.unescape(html_code)    
    html_with_removed_attributes = re.sub(r"(<[a-z]*)(\s*[a-z]*=\".*?\")*(>)", "\g<1>\g<3>", html_with_decoded_characters)
    html_with_removed_empy_tags = re.sub(r"<[^/>]+>[ \n\r\t]*</[^>]+>", " ", html_with_removed_attributes)
    html_with_removed_spaces = re.sub(r"\s\s+", " ", html_with_removed_empy_tags)
    return html_with_removed_spaces


def main(event, context):
    print(event)
    article_url = event["arguments"]["url"]
    article = Article(article_url, keep_article_html=True)
    article.download()
    article.parse()
    item_to_put = {
        "id": str(shortuuid.uuid()),
        "article": {
            "title": article.title,
            'originalText': article.text,
            'originalHtml': article.article_html,
            'html': clean_html_tags(article.article_html),
            "authors": article.authors,
            "publishDate": article.publish_date if not article.publish_date else Decimal(article.publish_date.timestamp()),
            "sourceUrl": article_url
        },
        "createdAt": Decimal(time.time()),
        "secretId": str(shortuuid.uuid())
    }
    add_article_to_dynamo(item_to_put)
    return item_to_put