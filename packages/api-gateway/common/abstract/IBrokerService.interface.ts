import { Experiment } from "src/database/experiment.entity";
import { User } from "src/database/user.entity";

export interface IBrokerService {
    sendMessage(type: string, experiment: Experiment, user: User): void
}