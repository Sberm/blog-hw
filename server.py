import uvicorn
from typing import Annotated
from fastapi import FastAPI, UploadFile
from bs4 import BeautifulSoup as bs
from bs4 import formatter
import aiofiles
import requests
import os
import yaml
import time
from time import strftime, localtime
from threading import Thread

app = FastAPI()

async def change_index(file_name: str):
    with open('index.html', 'rb') as html:
        soup = bs(html, 'html.parser')
    old_text = soup.find("img", {"id": "seasonal-img"})
    # TODO: https://www.google.com.hk/search?q=hello+world
    old_text.replace_with(f"""<img alt="seasonal_image" id = "seasonal-img" src="{file_name}"/>""")
    formatter_ = formatter.HTMLFormatter(indent=4)

    with open("index.html", "wb") as f:
        f.write(soup.prettify("utf-8", formatter_))


@app.post("/upload-file")
async def create_upload_file(file: UploadFile):
    file_name = file.filename
    contents = await file.read()
    print(f"received {file_name}")

    async with aiofiles.open(f"./images/seasonal/{file_name}", mode="wb") as af:
        await af.write(contents)
    
    # no dot
    await change_index(f"/images/seasonal/{file_name}")

    return {
        "code": 200,
        "msg": "success"
    }



# doc_html
class Doc:
    def __init__(self):
        self.doc_path = "./docs/content"
        self.doc_info = []
        self.last_read = -1.0

doc = Doc()

def update_html_doc():
    now = strftime("%H:%M:%S", localtime())
    print(f"updating docs/index.html {now}")
    html = open('./docs/index.html', 'rb')
    soup = bs(html, 'html.parser')
    old_text = soup.find("div", {"id": "doc-container"})
    docs = ""
    for di in doc.doc_info:
        name_without_ext = di.rsplit(".html", 1)[0]
        docs += f'<div class = "doc-item"><a href="content/{name_without_ext}" class = "doc-item"><p class = "doc-item">{name_without_ext}</p></a></div>'

    old_text.replace_with(f"<div id=\"doc-container\">{docs}</div>")
    formatter_ = formatter.HTMLFormatter(indent=4)
    
    with open("./docs/index.html", "wb") as f_output:
        f_output.write(soup.prettify("utf-8", formatter_))


# update_html
class Blog:
    def __init__(self):
        self.blog_path = "./blog"
        self.blog_info = []
        self.last_read = -1.0

blog = Blog()

def do_sample(html):
    soup = bs(html, features="html.parser")

    # kill all script and style elements
    for script in soup(["script", "style"]):
        script.extract()    # rip it out

    # get text
    text = soup.get_text()

    # break into lines and remove leading and trailing space on each
    lines = (line.strip() for line in text.splitlines())
    # break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # drop blank lines
    text = '\n'.join(chunk for chunk in chunks if chunk)
    return text

# curl http://127.0.0.1:4545/blog-info

def update_html_blog():

    now = strftime("%H:%M:%S", localtime())
    print(f"updating index.html {now}")
    html = open('./index.html', 'rb')
    soup = bs(html, 'html.parser')
    old_text = soup.find("div", {"id": "blog-index"})
    blogs = ""

    for bl in blog.blog_info:
        # name title date sample 
        blogs += f'<div class="blog-item"><div class = "date">{bl["date"]}</div><a class = "blog-link" href = "/blog/{bl["name"]}">{bl["title"]}</a><p class = "sample">{bl["sample"]}</p></div>'

    old_text.replace_with(f"<div id=\"blog-index\">{blogs}</div>")
    formatter_ = formatter.HTMLFormatter(indent=4)
    
    # Alter HTML file to see the changes done
    with open("./index.html", "wb") as f_output:
        f_output.write(soup.prettify("utf-8", formatter_))


def update_blog():

    # title, date, sample
    # update(new file) -> iterate in dir
    # no update -> send info

    do_ite = False

    mod_t = 0.0
    for root, _, files in os.walk(blog.blog_path):
        for file in files:
            mod_t = max(os.path.getmtime(os.path.join(root, file)), mod_t)

    if mod_t > blog.last_read:
        blog.last_read = mod_t
        do_ite = True

    if do_ite == True:
        blog_info = []
        yaml_info = {}
        with open("./title.yaml", "r") as f:
            yaml_info = yaml.full_load(f)
        for root, _, files in os.walk(blog.blog_path):
            for file in files:
                blog_item = {}
                if '.html' not in file or file == 'default.html':
                    continue
                filename = file.rsplit(".", 1)[0]
                blog_item['name'] = filename
                file_from_yaml = yaml_info.get(filename)
                blog_item['title'] = file_from_yaml.get("title") if file_from_yaml else ""
                blog_item['date'] = file_from_yaml.get("date") if file_from_yaml else "0000-00-00"
                with open(os.path.join(root, file), "r") as f:
                    html = f.read()
                    blog_item['sample'] = f"{(do_sample(html))[:50]}..."
                blog_info.append(blog_item)
        blog_info = sorted(blog_info, key=lambda x: x['date'], reverse=True)
        blog.blog_info = blog_info
        update_html_blog()

# convert
def generate_blog(file_name: str):

    now = time.strftime("%H:%M:%S", time.localtime())
    print(f"blog updating {now}")

    headers = {"Accept": "application/vnd.github+json", "Authorization": "Bearer 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", "X-GitHub-Api-Version": "2022-11-28"}
    url = "https://api.github.com/markdown"

    doc_flag = False
    if "_d" in file_name:
        doc_flag = True
    root_dir = "./md"

    file_path = f"{root_dir}/{file_name}"

    with open(f"{file_path}", 'r') as f:
        tmp = f.read()

    json_ = {
        "text": tmp
    }

    response = requests.post(headers=headers, json=json_, url=url)

    footer = """
<div id="footer-main">
    <div id="footer-line">
    </div>
    <div id="footer-text-wrapper">
        <p id="footer-text">
            The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.
        </p>
    </div>
    <div id="footer-commu-background">
        <div id="footer-commu">
            <div class="footer-image-container">
                <a href="https://www.youtube.com/watch?v=XqZsoesa55w">
                    <img class="footer-image" src="../images/linux.png"/>
                </a>
            </div>
            <div class="footer-image-container">
                <a href="https://twitter.com/Fernand73827208">
                    <img class="footer-image" src="../images/twitter.png"/>
                </a>
            </div>
            <div class="footer-image-container">
                <a href="https://github.com/torvalds">
                    <img class="footer-image" src="../images/github.svg"/>
                </a>
            </div>
        </div>
    </div>
</div>""" if not doc_flag else ""

    akiha = """
<div class="navi"><div class="image-container"><a href="https://sberm.cn" class="link-wrapper"><img src="/images/leave.png" class="leave-img"/></a></div></div>"""if not doc_flag else ""

    write_path = "./blog" if not doc_flag else "./docs"
    with open(f"{write_path}/{file_name.rsplit('.md',)[0]}.html", "w") as f:
        f.write(f"""
<!DOCTYPE html>
<html>
<head>
    <link href="/images/favicon.ico" rel="icon" type="/image/x-icon" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="github.css">
</head>
{akiha}
<div class = "spacing-div">
<article class="markdown-body">
{response.text}
</article>
{footer}
<div>
</div>
</div>
</html>""")

def check_new_files():
    global l_m_f
    for root,_, files in os.walk("./md"):
        for file in files:
            file_path = os.path.join(root, file)
            m_t = os.path.getmtime(file_path)
            if m_t > l_m_f and '.md' in file:
                l_m_f = m_t
                generate_blog(file)


# convert_doc
def generate_doc(file_path: str, dir_list: list[str]):
    now = time.strftime("%H:%M:%S", time.localtime())
    print(f"doc updating {now}")
    headers = {"Accept": "application/vnd.github+json", "Authorization": "Bearer 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", "X-GitHub-Api-Version": "2022-11-28"}
    url = "https://api.github.com/markdown"
    root_dir = "./docs/md"
    write_root = "./docs/content"
    # 乐唯/123/hello.md
    file_name = file_path.rsplit('md/', 1)[-1]
    file_name_path = file_name.rsplit('/', 1)[0]
    os.makedirs(f"{write_root}/{file_name_path}", exist_ok = True) 
    file_path = f"{root_dir}/{file_name}"
    with open(f"{file_path}", 'r') as f:
        tmp = f.read()
    json_ = {
        "text": tmp
    }
    response = requests.post(headers=headers, json=json_, url=url)
    write_path = f"{write_root}/{file_name}"
    with open(f"{write_path.rsplit('.', 1)[0]}.html", "w") as f:
        f.write(f"""
<!DOCTYPE html>
<html>
<head>
    <link href="/images/favicon.ico" rel="icon" type="/image/x-icon" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/docs/github.css">
</head>
<div class = "spacing-div">
<article class="markdown-body">
{response.text}
</article>
<div>
</div>
</div>
</html>""")

def check_new_docs():
    global l_m_d
    dir_list = []
    for root, dirs, files in os.walk("./docs/md"):
        for file in files:
            file_path = os.path.join(root, file)
            m_t = os.path.getmtime(file_path)
            if m_t > l_m_d and '.md' in file and file[0] != '.':
                for dir in dirs:
                    dir_list.append(os.path.join(root, dir).rsplit('md/', 1)[-1])
                l_m_d = m_t
                generate_doc(file_path, dir_list)

def update_doc():

    do_ite = False

    mod_t = 0.0
    for root, _, files in os.walk(doc.doc_path):
        for f in files:
            if '.html' not in f or f == 'default.html':
                continue
            mod_t = max(os.path.getmtime(os.path.join(root, f)), mod_t)

    if mod_t > doc.last_read:
        doc.last_read = mod_t
        do_ite = True

    
    if do_ite == True:
        doc_info_tmp = []
        for root, _, files in os.walk(doc.doc_path):
            for f in files:
                if '.html' not in f or f == 'default.html':
                    continue
                file_name = os.path.join(root, f).rsplit("docs/content/", 1)[-1]
                doc_info_tmp.append(file_name)
        doc.doc_info = doc_info_tmp
        update_html_doc()

def update_root():
    global l_m_f, l_m_d
    l_m_f = l_m_d = time.time()
    while True:
        try:
            # doc_html
            update_doc()
            # update_html
            update_blog()
            # convert
            check_new_files() # blog
            # convert_doc
            check_new_docs()
        except:
            from traceback import print_exc
            print("Internal error")
            print_exc()
        time.sleep(1)

t = Thread(target=update_root, args=[])
t.start()

uvicorn.run(host="127.0.0.1", port=21999, app=app)
