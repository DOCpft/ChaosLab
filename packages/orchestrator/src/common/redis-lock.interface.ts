export interface RedisLock {
    experimentId: string,
    faultType: string,
    params: any,
    duration: number,
    targetAgentId: string,
    userId: string
}