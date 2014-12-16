$(function () {
    $('.jm-start').click(function () {
        var partition = $(this).data('partition')
        var name = $(this).data('name')
        var partition = prompt('Please input start partition:', partition)
        if (partition) {
            window.open('/start?job_name=' + name + '&partition=' + partition, '_self')
        }
    })
    $('.jm-stop').click(function () {
        var name = $(this).data('name')
        if (confirm('Are you sure to stop job : ' + name)) {
            window.open('/stop?job_name=' + name, '_self')
        }
    })
    $('.jm-delete').click(function () {
        var name = $(this).data('name')
        if (confirm('Are you sure to delete job : ' + name + '(you should remove the job config file first)')) {
            window.open('/delete?job_name=' + name, '_self')
        }
    })

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    var updatePage = function () {
        if ($('#jm-auto-update').prop('checked')) {
            location.reload()
        }
        setTimeout(updatePage, 5000)
    }
    setTimeout(updatePage, 5000)
})