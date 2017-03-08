'use babel';

import Element from './element';
import { CompositeDisposable } from 'atom';

import EditorManagerList from './EditorManagerList';

//this is the main module that should manage everything

class Main {

    constructor() {
        console.log('main - constructor');

        //this array will hold all of the managers for the specific editor panels
        this.editorManagerList = new EditorManagerList();
    }

    activate(state) {
        console.log('main - activate');

        //this.ElementModel = new Element(state.htmlStructureVisViewState);
        //this.active = false;

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'html-structure-vis:toggle': () => this.toggle()
        }));
    }

    deactivate() {
        console.log('main - deactivate');
        //this.modalPanel.destroy();
        this.subscriptions.dispose();
        //this.ElementModel.destroy();
    }

    serialize() {
        console.log('main - serialize');
        return {
            //htmlStructureVisViewState: this.ElementModel.serialize()
        };
    }

    toggle() {
        console.log('main - toggle');

        var currentEditor = atom.workspace.getActiveTextEditor();

        //if settings panel then will be undefined
        if(!currentEditor) {
            //@todo add notification here - msg: no valid editor selected
            return
        }

        var manager = this.editorManagerList.getManager(currentEditor.id);

        if(!manager) {
            manager = this.editorManagerList.addManager(currentEditor.id);
        }

        manager.toggleView();
    }
}

//export a singleton
export default new Main();
