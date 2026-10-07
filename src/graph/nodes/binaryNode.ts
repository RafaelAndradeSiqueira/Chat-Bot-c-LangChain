import { type GraphState } from "../graph.ts";

export function binaryNode(state: GraphState): GraphState {

    const binaryOutput = Array.from(Buffer.from(state.output, 'utf8'))
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join(' ');

    return {
        ...state,
        output: binaryOutput,
    }

}