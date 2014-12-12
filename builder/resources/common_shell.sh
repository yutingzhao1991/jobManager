#!/bin/bash
#
# Author: Tingzhao Yu (yutingzhao@qiyi.com)
#

JOB_NAME=
JOB_COMMAND_LIST=

COMMAND_SEPARATOR=";"

function time_echo {
    echo `date "+[%Y-%m-%d %H:%M:%S] "`"$@"
}

function ExecuteJob() {

    local _DEPENDENT_JOB_WAIT_INTERVAL=600

    time_echo "==== Start building $JOB_NAME of $PARTITION ===="
    time_echo "{{JOB_NAME::$JOB_NAME}}"
    time_echo "{{PID::$$}}"
    time_echo "{{PARTITION::$PARTITION}}"
    time_echo "{{JOB::START}}"

    # Start run all command
    local _OLD_IFS=$IFS
    IFS=$COMMAND_SEPARATOR
    for i in $JOB_COMMAND_LIST
    do
        local _CMD="$i"
        eval $_CMD
        if [ $? -eq 0 ]; then
            time_echo "Success to run command: '$_CMD'."
        else
            time_echo "{{FAILED_TASK::$_CMD}}"
            time_echo "Failed to run command: '$_CMD'."
            time_echo "{{JOB::FAILED}}"
            exit 1
        fi
    done
    time_echo "{{JOB::SUCCESS}}"
    IFS=$_OLD_IFS

}
