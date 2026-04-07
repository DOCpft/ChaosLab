export interface MessageOfQueue {
    type: string,
    experimentId: string,
    faultType: string,
    params: any,
    duration: number,
    targetAgentId: string,
    userId: string
}