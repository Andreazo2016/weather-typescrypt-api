import { InternalError } from "@src/util/errors/internal-error";

export class ExternalResponseError extends InternalError {
  constructor(message: string, clientName: string) {
    super(`Unexpected error returned by the ${clientName} service: ${message}`);
  }
}