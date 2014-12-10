jobManager (DOING)
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

2:Modify config.js to configurate your MongoDB setting.

2:Writing your own job config in jobs folder refer to demo config demo.a.json, json file name is your job name.

3:Run sh build.sh to init jobs.

4:Run 'npm start' start up monitor (or use node monitor/index.js).

5:Then you can visitor 127.0.0.1:[port] to manager your jobs.


Job config:
-------

```
{
    "frequency": "quarterly", // // value in (quarterly, hourly, daily, weekly, monthly)
    "dependencies": [{
        "job": "demo.b",
        "frequency": "quarterly"
    }],
    "tasks": [{
        "plugin": "base",
        "config": {
            "command": "echo \"test demo a\""
        }
    }]
}
```

Tips:
------
You can write your own plugin to make your work more efficient.

Variable in your shell command can be used:

1.$DATE

2.$HOUR

3.$QUARTER

...


*Welcome to contribute your code*


