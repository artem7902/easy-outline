import time
import uuid
import os
import sys
sys.path.append("/var/task" + "/.venv/lib/python3.7/site-packages")
print(sys.path)

from newspaper import Article

def main(event, context):
    print(event)
    article_url = event["arguments"]["url"]
    article = Article(article_url)
    article.download()
    article.parse()
    item_to_put = {
        "id": str(uuid.uuid1()),
        "article": {
            "title": article.title,
            'originalText': article.text,
            "authors": article.authors,
            "publishDate": article.publish_date if not article.publish_date else article.publish_date.timestamp(),
        },
        "createdAt": time.time(),
        "secretId": str(uuid.uuid1())
    }
    return item_to_put