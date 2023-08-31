# ps aux | grep -E "update|convert|doc_html|convert_doc"
# nohup python3 -u scripts/update_html.py > update_html.log &
# nohup python3 -u md/convert.py > convert.log &
# nohup python3 -u scripts/doc_html.py > doc_html.log &
# nohup python3 -u docs/md/convert_doc.py > convert_doc.log &
nohup python3 -u server.py > server.log &