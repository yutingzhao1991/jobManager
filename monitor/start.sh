cd _jobs
# $1 is the job name
_JOB_NAME=$1
_PARTITION=$2
PID=`ps aux | grep $_JOB_NAME.sh | grep -v grep | awk '{print $2}'`
if [[ "$PID" != "" ]]; then
    echo "job $_JOB_NAME already start"
    exit 1
fi
# TODO move old log for backup
nohup sh $_JOB_NAME.sh $_PARTITION > $_JOB_NAME.log &