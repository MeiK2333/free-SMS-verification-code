from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

engine = create_engine("sqlite:///:memory:")

Base = declarative_base()

Session = sessionmaker(bind=engine)
session = Session()


class Phone(Base):
    __tablename__ = "phone"

    id = Column(Integer, primary_key=True)
    phone_number = Column(String, index=True)
    sms = relationship("SMS", order_by="SMS.recv_time", back_populates="phone")
    detail_url = Column(String)
    active = Column(Boolean, default=True)
    site = Column(String)


class SMS(Base):
    __tablename__ = "sms"

    id = Column(Integer, primary_key=True)
    phone_id = Column(Integer, ForeignKey("phone.id"))
    phone = relationship("Phone", back_populates="sms")
    text = Column(String)
    recv_time = Column(DateTime)
    sms_id = Column(String)
    send_phone = Column(String)


Base.metadata.create_all(engine, tables=[Phone.__table__, SMS.__table__])
