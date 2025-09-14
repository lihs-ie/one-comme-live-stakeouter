import { err, type Result } from 'neverthrow';

import { badRequest, conflict, notFound, other, unauthorized, RouteError } from 'aspects/error';

export const handleErrorResponse = <T>(response: Response): Result<T, RouteError> => {
  const statusText = response.statusText;

  switch (response.status) {
    case 400:
      return err(badRequest(statusText));

    case 401:
      return err(unauthorized(statusText));

    case 404:
      return err(notFound(statusText));

    case 409:
      return err(conflict(statusText));

    default:
      return err(other(statusText));
  }
};
