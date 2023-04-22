const constants = {
  article: {
    tabTitle: (articleTitle?: string) =>
      articleTitle && `${articleTitle} | Easy Outline - highlight and share`,
  },
  deleteDialog: {
    title: "Delete confirmation",
    body: `Clicking the delete button will result in article being deleted from the database.
        The article will become unavailable for all people you shared the link with.`,
    cancelLabel: "Cancel",
    confirmLabel: "Delete",
  },
};

export default constants;
