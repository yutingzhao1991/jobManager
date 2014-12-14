jobManager
==========

A program to manager and monitor your linux shell jobs, based on NodeJS.


Dependencies:
-------------

- Linux / Unix

- NodeJS

- MongoDB

- Shell Command : date, kill ...


Usage:
------

1:Run 'npm install' to install necessary NodeJS packages.

2:Copy config.default.json to config.json and configurate your MongoDB setting.

2:Writing your own job config in jobs folder refer to demo config demo.a.json, json file name is your job name.

3:Run sh build.sh to init jobs.

4:Run node monitor/bk_index.js to start backend log scaner and run node monitor/fe_index.js to start monitor web server.

5:Then you can visitor 127.0.0.1:[port] to manager your jobs.


Job config:
-------

```
{
    "frequency": "quarterly", // value in (quarterly, hourly, daily, weekly, monthly)
    "dependencies": [{
        "job": "demo.b"
    }],
    "tasks": [{
        "plugin": "base",
        "config": {
            "command": "echo \"test demo a\""
        }
    }]
}
```

Project config:
-------

```
{
    "port": 3000, // monitor web server port
    "db": "mongodb://127.0.0.1/test", // mongodb access string
    "alertInterval": 3600, // delay job and error job alert interval
    "email": { // email configration
        "host": "",
        "auth": {
            "user": "",
            "pass": ""
        },
        "from": "",
        "to": ""
    }
}
```


Tips:
------
You can write your own plugin to make your work more efficient.

Variable in your shell command can be used:

1.$PARTITION # like 2014/12/12/12/2   when frequency is monthly, the partition is the last day of month.

2.$DATE # like 2014-12-12


TODO:
------

- Delay email alert

- Support more frequency type, maybe strong like crontab

- Support view log in monitor

- frontend page auto update

- delay time display


*Welcome to contribute your code*


