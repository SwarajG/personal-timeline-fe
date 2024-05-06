export default function Image({ src, alt, wrapperClassName, ...rest }) {
  const rootPath = process.env.REACT_APP_CLOUDFRONT_URL;
  return <img src={`${rootPath}/${src}`} className={wrapperClassName} alt={alt} {...rest} />;
}
