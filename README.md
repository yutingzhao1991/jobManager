jobManager
==========

A program to manager and monitor your linux shell jobs ( In fact, your job is a shell command ), based on NodeJS.


![monitor](https://cloud.githubusercontent.com/assets/1061968/5429930/c320770a-843a-11e4-8ca4-5c88bf25a978.png)

![logviewer](https://cloud.githubusercontent.com/assets/1061968/5429922/afa34c16-843a-11e4-986e-b7f1154670f2.png)


Dependencies:
-------------

- Linux / Unix

- NodeJS

- MongoDB

- Shell Command : date, kill ...


Usage:
------

1:Run `npm install` to install necessary NodeJS packages.

2:Copy config.default.json to config.json and configurate your MongoDB setting.

2:Writing your own job config in jobs folder refer to demo config demo.a.json, json file name is your job name.

3:Run `npm run build` to init jobs.

4:Run `npm run bk` to start backend log scaner and run `npm run fe` to start monitor web server.

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
        "retry": false, // is auto retry, default is false, is it is true job this task will retry untill success
        "config": { // you can get this config in you plugin
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

Job status:

- waiting : waiting dependencies job ready or bk_index start the job

- progressing : running

- success : success and waiting next partition

- failed : ocurr error in job shell

- error : ocurr error in monitor

- dead : job dead when progressing

- stop : stoped, nothing will happen with this job.


Tips:
------
You can write your own plugin to make your work more efficient.

Variable in your shell command can be used:

1.$PARTITION # like 2014/12/12/12/2   when frequency is monthly, the partition is the last day of month.

2.$DATE # like 2014-12-12

3.$YEAR # like 2014

4.$MONTH # 0 - 11

5.$SHORT_DATE # 1 - 31

6.$HOUR # 0 - 23

7.$QUARTER # 0 1 2 3


Change Log:
----------

- 0.0.1 : first version release

- 0.0.2 : support email alert and auto retry task

- 0.0.3 : support view log

- 0.0.4 : fix alerter bug

- 0.0.5 : add jobName and jobConfig to plugins

- 0.0.6 : support delete job and auto update page

- 0.0.7 : more variable

- 0.0.8 : log view update


Plugin:
--------

Every job is a set of tasks, each task is build with a plugin.

You can write your won plugin to manager your code.

Write plugin in folder plugins, each plugin in a independent folder and include a nodeJS file index.js.

Your plugin module will get the config witch define in your job config json file, and you should retrun a command string.

Manager will run all task of your job one by one.


TODO:
------


- Support more frequency type, maybe strong like crontab

- frontend page auto update

- delay time display

- program log optimization

- handle kill job faild, aviod two same job running

- Handle job's status better

- Unit Test

- Support end time


*Welcome to contribute your code*


