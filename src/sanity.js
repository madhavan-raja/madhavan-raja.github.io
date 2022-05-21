import sanityClient from "@sanity/client";

const client = sanityClient({
    projectId: "3i4cmt4j",
    dataset: "production",
    apiVersion: "v1",
    useCdn: true,
});

export default client;