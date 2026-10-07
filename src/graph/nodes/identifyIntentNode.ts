import { type GraphState } from "../graph.ts";

export function identifyIntent(state: GraphState): GraphState {
    const input = state.messages.at(-1)?.text ?? ""
    const IsBinary = isBinary(input)

    let command: GraphState['command'];

    if(IsBinary) {
        command = 'text'
    } else {
        command = 'binary'
    }

    return {
        ...state,
        command,
        output: input
    }

}

function isBinary(texto : string) : boolean {
    return /^[01]+(\s+[01]+)*$/.test(texto.trim());
}