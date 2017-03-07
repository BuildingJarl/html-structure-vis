'use babel';

import Element from './element';
import { CompositeDisposable } from 'atom';

export default {

  htmlStructureVisView: null,
  modalPanel: null,
  subscriptions: null,

  //This function is the only required method. Initialise all your modules, views or helpers here!
  activate(state) {
    console.log(state)
    this.ElementModel = new Element(state.htmlStructureVisViewState);
    this.active = false;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'html-structure-vis:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    //this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.ElementModel.destroy();
  },

  serialize() {
    return {
      htmlStructureVisViewState: this.ElementModel.serialize()
    };
  },

  toggle() {
    console.log('Element was toggled!');
    var textEditor = atom.workspace.getActiveTextEditor()
    var textEditorElement = atom.views.getView(textEditor)

    if(!this.active) {
      textEditorElement.appendChild(this.ElementModel.getElement());
       this.ElementModel.createSVG();
      this.active = true;
    } else {
      textEditorElement.removeChild(this.ElementModel.getElement());
      this.active = false;
    }
  }

};
