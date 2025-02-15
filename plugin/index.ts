export default async function plugin(context, options) {
    // ...
    return {
      name: 'my-plugin',
      async loadContent() {
        /* ... */
      },
      async contentLoaded({content, actions}) {
        /* ... */
      },
      /* other lifecycle API */
    };
  }