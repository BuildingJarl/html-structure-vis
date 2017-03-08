'use babel';

import Element from './element';
import { CompositeDisposable } from 'atom';

//this is the main module that should manage everything

class Main {

    constructor() {
        console.log('main - constructor');

        //this array will hold all of the managers for the specific editor panels
        this.editorManagers = [];
    }

    activate(state) {
        console.log('main - activate');

        //this.ElementModel = new Element(state.htmlStructureVisViewState);
        this.active = false;

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
            htmlStructureVisViewState: this.ElementModel.serialize()
        };
    }

    toggle() {
        console.log('main - toggle');

        var textEditor = atom.workspace.getActiveTextEditor();
        var textEditorElement = atom.views.getView(textEditor);


        //just testing stuff out

        var d1 = textEditor.onDidChange( (what)=> {
            //important not to perform any expensive operations via this method
            console.log('onDidChange');
            //console.log(what);
        });

        var d2 = textEditor.onDidStopChanging( (what)=> {
            //Event emitted asynchronously 300ms after the last buffer change.
            //Good place to handle changes to the buffer without compromising typing performance.
            console.log('onDidStopChanging');
            //console.log(what);

            var contents = textEditor.getText();
            //this is just to see if it works. Might be better to change to an event based system
            this.ElementModel.updateTree(contents);
        });

        var d3 = textEditor.onDidChangeCursorPosition( (what) => {
            //Calls your callback when a Cursor is moved
            //If there are multiple cursors, your callback will be called for each cursor.
            console.log('onDidChangeCursorPosition');
            //console.log(what);
        });

        var d4 = textEditor.onDidDestroy( (what) => {
            //Invoke the given callback when the editor is destroyed.
            console.log('onDidDestroy');
            //console.log(what);

            //not sure if this is correct, but these events should be disposed of when textEditor is removed!
            d1.dispose();
            d2.dispose();
            d3.dispose();
            d4.dispose();
        });

        if(!this.active) {
            textEditorElement.appendChild(this.ElementModel.getElement());
            //this.ElementModel.createSVG();
            this.active = true;
        } else {
            textEditorElement.removeChild(this.ElementModel.getElement());
            this.active = false;
        }
    }
}

//export a singleton
export default new Main();
