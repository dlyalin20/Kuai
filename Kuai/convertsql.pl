#! /usr/bin/perl
use strict;
use warnings;
use 5.010; # for s/\K//;

while( <> ){
  next if m'
    BEGIN TRANSACTION   |
    COMMIT              |
    sqlite_sequence     |
    CREATE UNIQUE INDEX
  'x;

  if( my($name,$sub) = m'CREATE TABLE \"([a-z_]*)\"(.*)' ){
    # remove "
    $sub =~ s/\"//g; #"
    $_ = "DROP TABLE IF EXISTS $name;\nCREATE TABLE IF NOT EXISTS $name$sub\n";

  }elsif( /INSERT INTO \"([a-z_]*)\"(.*)/ ){
    $_ = "INSERT INTO $1$2\n";

    # " => \"
    s/\"/\\\"/g; #"
    # " => '
    s/\"/\'/g; #"

  }else{
    # '' => \'
    s/\'\'/\\\'/g; #'
  }

  # 't' => 1
  s/[^\\']\K\'t\'/1/g; #'

  # 'f' => 0
  s/[^\\']\K\'f\'/0/g; #'

  s/AUTOINCREMENT/AUTO_INCREMENT/g;
  print;
}