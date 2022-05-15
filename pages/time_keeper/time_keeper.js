class TimeKeeperPage extends TimeKeeperControllerBase {
    constructor(p) {
        super(p);

        super._addClickEvent();
    }

    prepareShow() {
        console.log('start prepareShow : ' + this.pageId);
    }

    _clickEvent(event) {
        try {
            let target = event.target;
            let classList = target.classList;
            console.log('start _clickEvent : ' + target.id);
            if (classList.contains('move-task-manage')) {
                _pager.changePageById('PP1001');
            }
        } finally {
            super._clickEvent(event);
        }
    }
}