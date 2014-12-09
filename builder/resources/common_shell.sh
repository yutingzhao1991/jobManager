#!/bin/bash
#
# Author: Tingzhao Yu (yutingzhao@qiyi.com)
#

JOB_NAME=
PARTITION=
JOB_COMMAND_LIST=

COMMAND_SEPARATOR=";"

function ExecuteJob() {

    local _TIMER="date +%Y-%m-%d-%T"
    local _DEPENDENT_JOB_WAIT_INTERVAL=600

    echo `$_TIMER`" ==== Start building $JOB_NAME of $PARTITION ===="

    # Start run all command
    local _OLD_IFS=$IFS
    IFS=$COMMAND_SEPARATOR
    for i in $JOB_COMMAND_LIST
    do
        local _CMD="$i"
        eval $_CMD
        if [ $? -eq 0 ]; then
            echo `$_TIMER`" success to run command: '$_CMD'."
        else
            echo `$_TIMER`" Failed to run command: '$_CMD'."
            exit 1
        fi
    done
    IFS=$_OLD_IFS

}
