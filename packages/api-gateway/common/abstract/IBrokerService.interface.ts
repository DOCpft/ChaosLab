import { Experiment } from "src/experiments/experiment.entity";
import { User } from "src/users/user.entity";

export interface IBrokerService {
    sendMessage(type: string, experiment: Experiment, user: User): void
}