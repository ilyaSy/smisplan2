import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import { dataTable, metaData } from '../../config/data';
import storage from '../../storages/commonStorage';
import PopupSimpleOutput from '../PopupSimpleOutput/PopupSimpleOutput';

const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];
const weekDays = [
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
  'воскресение',
];
const calendarModes = {
  today: 'Сегодня',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  list: 'Список',
};

export default class MainCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dates: this.props.dates,

      popupText: '',
      popupFormat: undefined,
      popupTitle: '',
      popupIsOpened: false,
    };

    this.handleClosePopup = this.handleClosePopup.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      const { tableName } = storage.state.getState().STATE;
      if (tableName && !dataLoading) {
        this.setState({ dates: [] });
      }
      if (dataLoading && dataLoading === 'data') {
        this.setState({ dates: dataTable });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleClosePopup = () => this.setState({ popupIsOpened: false });

  handleDayClick = (day) => {
    const dates = this.state.dates
      .filter((date) => date.date === day.dateStr)
      .sort((a, b) => (a.time > b.time ? 1 : -1));

    const text =
      dates.length > 0
        ? dates
            .map(
              (date) => `${date.time.replace(/(\d+):(\d+):(\d+)/, '$1:$2')}\n${date.description}`
            )
            .join('\n\n')
        : 'Нет назначенных совещаний';

    this.setState({
      popupText: text,
      popupFormat: undefined,
      popupTitle: `Совещания за день`,
      popupIsOpened: true,
    });
  };

  handleEventClick = (event) => {
    const info = {
      title: event.event.title,
      date: event.event.start.toLocaleDateString().replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1'),
      time: event.event.start.toLocaleTimeString(),
      fullDate: event.event.start,
    };
    const dateEvent = this.state.dates.filter(
      (date) =>
        date.date === info.date && date.time === info.time && date.description === info.title
    )[0];

    let text = '';
    text += `Тема;${dateEvent.description}`;
    text += `\nОтветственный;${metaData.developerList[dateEvent.responsible].value}`;
    text += `\nУчастники;${dateEvent.participants
      .split(',')
      .map((p) => metaData.developerList[p].value)
      .join(', ')}`;
    text += `\nДата;${info.fullDate.getDate()} ${months[info.fullDate.getMonth()]}, ${
      weekDays[info.fullDate.getDay() - 1]
    }`;
    text += `\nВремя;${info.time.replace(/(\d+):(\d+):(\d+)/, '$1:$2')}`;

    this.setState({
      popupText: text,
      popupFormat: 'listOfData',
      popupTitle: `Совещаниe`,
      popupIsOpened: true,
    });
  };

  getBackgroundColorByDate = (date) => {
    let backgroundColor = '';
    if (date.status === 'rejected') {
      backgroundColor = 'red';
    } else if (['done', 'postponed'].includes(date.status)) {
      backgroundColor = 'green';
    } else if (!date.result) {
      backgroundColor = 'green';
    }

    return backgroundColor;
  };

  render() {
    const dates = this.state.dates.map((date) => ({
      title: date.description,
      start: `${date.date}T${date.time}`,
      end: `${date.date}T${date.time}`,
      backgroundColor: this.getBackgroundColorByDate(date),
    }));

    let initialView = 'dayGridMonth';
    if (/\/calendar\/list/.test(document.location.pathname)) {
      initialView = 'listWeek';
    }

    return (
      <>
        <FullCalendar
          events={dates}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit' }}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={initialView}
          dateClick={this.handleDayClick}
          eventClick={this.handleEventClick}
          locale="ru"
          selectable
          weekNumberCalculation="ISO"
          weekends={false}
          slotMinTime="08:00:00"
          headerToolbar={{
            left: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            center: 'title',
            right: 'today prev,next',
          }}
          buttonText={calendarModes}
        />

        <PopupSimpleOutput
          isOpened={this.state.popupIsOpened}
          text={this.state.popupText}
          format={this.state.popupFormat}
          title={this.state.popupTitle}
          onClose={this.handleClosePopup}
        />
      </>
    );
  }
}
