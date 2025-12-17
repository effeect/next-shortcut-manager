// Taken from my other repo : https://github.com/effeect/GitSearch/blob/main/src/components/atoms/LoadingIcon/LoadingIcon.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoadingIcon = () => {
  return (
    <>
      <div className="mt-4"></div>
      <div className="container has-text-centered">
        <FontAwesomeIcon
          // The icon prop takes the imported icon object
          icon={faSpinner}
          // The spin prop automatically adds the spinning animation
          spin
          // The size prop replaces classes like fa-3x
          size="3x"
          // Use Bulma text helpers to color the icon
          className="has-text-primary"
          aria-label="Loading content"
        />
        {/* <p className="mt-2 is-size-6 has-text-grey">Loading repositories...</p> */}
      </div>
      <div className="mt-4"></div>
    </>
  );
};

export default LoadingIcon;
