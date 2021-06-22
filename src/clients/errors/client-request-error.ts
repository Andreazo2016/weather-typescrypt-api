import { InternalError } from "@src/util/errors/internal-error";

export class ClientRequestError extends InternalError {
  constructor(message: string, clientName: string) {
    super(`Unexpected error when trying to communicate to ${clientName}:${message}`)
  }
}