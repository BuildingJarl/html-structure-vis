'use babel';

import EditorManager from './editorManager';

export default class EditorManagerList {

    constructor() {
        this.managers = [];
    }

    addManager(editor) {
        var manager = new EditorManager(editor);
        this.managers.push(manager);

        console.log(`EditorManager ${manager.id} added to list`);

        return manager;
    }

    removeManager(id) {
        var manager = this.getManager(id);
        var index = this.managers.indexOf(manager);

        this.managers.splice( index, 1 );

        console.log(`EditorManager ${manager.id} removed from list`);
    }

    getManager(id) {
        var manager = this.managers.find( (m) => { return m.id === id });
        return manager;
    }

}
