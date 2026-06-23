import "./title.css";
export const Title = ({ title, subtitle }) => (
    <div className="title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
    </div>
);