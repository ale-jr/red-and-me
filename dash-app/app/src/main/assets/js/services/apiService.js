export const request = ({ url, method, body, params }) => {
  const fetchUrl = new URL(
    url.startsWith("/") ? `${window.location.origin}${url}` : url
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      fetchUrl.searchParams.append(key, value);
    });
  }

  const headers = new Headers();
  headers.append("token", localStorage.getItem("credentials"));
  if (body) headers.append("Content-Type", "application/json");

  return fetch(fetchUrl, {
    body: body ? JSON.stringify(body) : null,
    headers,
    method,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Request error");
      }
    })
    .catch((error) => {
      const errorElement = document.querySelector("#error-element");
      if (errorElement) {
        errorElement.innerText = error.message;
        errorElement.classList.remove("hidden");
      }
    });
};
