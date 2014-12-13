$(function () {
    $('.jm-start').click(function () {
        var partition = $(this).data('partition')
        var name = $(this).data('name')
        var partition = prompt('Please input start partition:', partition)
        if (partition) {
            window.open('/start?job_name=' + name + '&partition=' + partition, '_self')
        }
    })
})