POST https://vscode-dev.smallweb.run/api/fs/createDirectory
{
    "path": "/dir"
}
HTTP 200

POST https://vscode-dev.smallweb.run/api/fs/writeFile
{
  "path": "/dir/example.txt",
  "b64": "aGVsbG8gd29ybGQK",
  "options": {
    "create": true,
    "overwrite": true
  }
}
HTTP 200

# Checking readFile Endpoint:
POST https://vscode-dev.smallweb.run/api/fs/stat
{
    "path": "/dir/example.txt"
}
HTTP 200


POST https://vscode-dev.smallweb.run/api/fs/readDirectory
{
    "path": "/dir"
}
HTTP 200

POST https://vscode-dev.smallweb.run/api/fs/copy
{
    "source": "/dir/example.txt",
    "destination": "/dir/example2.txt"
}
HTTP 200

POST https://vscode-dev.smallweb.run/api/fs/rename
{
    "oldPath": "/dir/example2.txt",
    "newPath": "/dir/example3.txt"
}
HTTP 200

POST https://vscode-dev.smallweb.run/api/fs/delete
{
    "path": "/dir/example3.txt"
}
HTTP 200

POST https://vscode-dev.smallweb.run/api/fs/delete
{
    "path": "/dir",
    "options": {
        "recursive": true
    }
}
HTTP 200
