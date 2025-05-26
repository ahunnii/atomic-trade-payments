export const formatEmailDomain = () => {
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME?.replace(
    /^https?:\/\//,
    "",
  );

  if (!hostname) {
    throw new Error("Hostname is not set");
  }

  return `${hostname}`;
};
