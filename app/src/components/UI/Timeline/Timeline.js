import React from "react";
import styles from "./Timeline.module.css";

function Timeline(props) {
  const timelineEl = [];
  for (let hour = 0; hour < 24; hour++) {
    timelineEl.push(
      <div className={styles.row}key={hour}>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
      </div>
    )
  }
  return (
    <div className={styles.TimelineContainer} ref={props.refT}>
      <div className={styles.rowHeader}>
        <div>0</div>
        <div>10</div>
        <div>20</div>
        <div>30</div>
        <div>40</div>
        <div>50</div>
        <div>60</div>
      </div>
      <div className={styles.colHeader}>
        <div>0</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>10</div>
        <div>11</div>
        <div>12</div>
        <div>13</div>
        <div>14</div>
        <div>15</div>
        <div>16</div>
        <div>17</div>
        <div>18</div>
        <div>19</div>
        <div>20</div>
        <div>21</div>
        <div>22</div>
        <div>23</div>
        <div>24</div>
      </div>
      <div className={styles.timelineWrapper}>
        {timelineEl}
        {props.dailyTimeline}
      </div>
    </div>
  )
}

export default Timeline;